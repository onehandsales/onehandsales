import { expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createClientStore } from "@/features/clients";
import { createTeamStore } from "@/features/team";
import { createProjectStore } from "@/features/projects";
import { createTaskStore } from "@/features/tasks";
import { createTemplateStore } from "./create-template-store";
import { applyTaskTemplate } from "./apply-task-template";
import { emptyTemplateTask } from "../model/template-values";
// 기능 : 기존 프로젝트·업무 원본과 새 템플릿 원본을 실제 목 문맥으로 함께 연결한다.
function setup() { const runtime=createPreviewRuntime();const clients=createClientStore(runtime);const team=createTeamStore(runtime);const projects=createProjectStore(runtime,clients,team);const tasks=createTaskStore(runtime,projects,team);const templates=createTemplateStore(runtime);clients.connect();team.connect();projects.connect();team.connectProjects(projects);tasks.connect();templates.connect();runtime.setSession("preview-a");return {runtime,team,projects,tasks,templates}; }
// 기능 : 실행 시점의 계정·workspace revision을 고정한다.
function scope(runtime: ReturnType<typeof createPreviewRuntime>) { const s=runtime.getSnapshot();return {actorId:s.session!.id,workspaceId:s.workspaceId!,revision:s.revision}; }
// 기능 : 독립 요청마다 취소 신호를 새로 만든다.
function signal() { return new AbortController().signal; }
const projectId="studio-a:team-project-2";
// 기능 : 동명 두 구성 작업·로컬 파일·완료된 초안 하위를 가진 템플릿을 준비한다.
async function source(context: ReturnType<typeof setup>) { const s=scope(context.runtime);const template=await context.templates.create(s,"Default Task","source",signal());const draft={...emptyTemplateTask(),title:"Update company guideline",description:"Description",files:[{id:"source-file",name:"local.png",file:new Blob(["local bytes"],{type:"image/png"})}],subtasks:[{id:"source-child",title:"Send invite",completed:true}]};await context.templates.saveTask(s,template.id,null,0,draft,"first",signal());await context.templates.saveTask(s,template.id,null,0,draft,"second",signal());return context.templates.current(s,template.id)!; }
// 기능 : 실제 일괄 적용을 동일 원본/문맥의 서비스 경계로 호출한다.
function apply(c: ReturnType<typeof setup>, templateId: string, intent: string, target=projectId, abort=signal()) { return applyTaskTemplate(c.templates,c.projects,c.tasks,scope(c.runtime),templateId,target,intent,abort); }

// 기능 : 한 의도·반복 의도·동명·첨부·하위 ID·완료/기한 기본값과 기존 시간 불변을 검증한다.
it("G31 atomically creates distinct sets with independent IDs and never copies completion, due dates or existing time", async () => {
 const c=setup();const template=await source(c);const s=scope(c.runtime);const before=c.projects.current(s,projectId)!;const originals=(await c.tasks.read(s,signal())).map(row=>c.tasks.current(s,row.id)!);
 const [first,retry]=await Promise.all([apply(c,template.id,"one"),apply(c,template.id,"one")]);expect(first).toHaveLength(2);expect(first.map(t=>t.id)).toEqual(retry.map(t=>t.id));const second=await apply(c,template.id,"two");expect(await c.tasks.read(s,signal())).toHaveLength(7);
 const all=[...first,...second];expect(new Set(all.map(t=>t.id)).size).toBe(4);expect(new Set(all.map(t=>t.subtasks[0]!.id)).size).toBe(4);expect(new Set(all.map(t=>t.files![0]!.id)).size).toBe(4);
 for(const task of all){expect(task).toMatchObject({status:"To Do",assigneeId:null,dueDate:"",activities:[],description:"Description"});expect(task.subtasks[0]).toMatchObject({parentTaskId:task.id,completed:false,assigneeId:null});expect(task.subtasks[0]!.id).not.toBe("source-child");expect(task.files![0]!.file.size).toBe(11);}
 const a=first[0]!;await c.tasks.edit(s,a.id,0,{...a,title:"Changed project task"},signal());await c.tasks.editSubtask(s,a.id,a.subtasks[0]!.id,0,{completed:true,title:"Changed child"},signal());await c.tasks.complete(s,a.id,1,true,signal());expect(c.tasks.current(s,a.id)?.files?.[0]?.file.size).toBe(11);
 const original=template.tasks[0]!;await c.templates.saveTask(s,template.id,original.id,original.revision,{...original,title:"New template title",files:[],subtasks:[]},"edit",signal());expect(c.tasks.current(s,second[0]!.id)?.title).toBe("Update company guideline");expect(c.tasks.current(s,a.id)?.title).toBe("Changed project task");
 await c.tasks.remove(s,a.id,2,"archive",signal());await c.tasks.remove(s,first[1]!.id,0,"delete",signal());expect(c.templates.current(s,template.id)?.tasks).toHaveLength(2);expect(c.tasks.current(s,second[1]!.id)).not.toBeNull();expect(c.projects.current(s,projectId)).toEqual(before);for(const task of originals)expect(c.tasks.current(s,task.id)).toEqual(task);
});
// 기능 : 한 구성 오류·저장 실패·취소·사라진 결과의 재시도에서 부분 생성과 부활을 막는다.
it("G31 rejects empty/inaccessible/invalid batches and retries failed intents without partial tasks or resurrection", async () => {
 const c=setup();const s=scope(c.runtime);const empty=await c.templates.create(s,"Empty","empty",signal());await expect(apply(c,empty.id,"empty")).rejects.toThrow("no tasks");const template=await source(c);await expect(apply(c,template.id,"bad-project","studio-b:team-project-2")).rejects.toThrow("project");
 await expect(c.tasks.createBatch(s,{projectId,sourceId:template.id,sourceRevision:template.revision,submissionId:"invalid",items:[template.tasks[0]!,{...template.tasks[1]!,title:" "}]},()=>{},signal())).rejects.toThrow("title");expect(await c.tasks.read(s,signal())).toHaveLength(3);
 c.tasks.setScenario("write-error");await expect(apply(c,template.id,"retry")).rejects.toThrow("preserved");expect(await c.tasks.read(s,signal())).toHaveLength(3);const saved=await apply(c,template.id,"retry");expect(saved).toHaveLength(2);await c.tasks.remove(s,saved[0]!.id,0,"delete",signal());await expect(apply(c,template.id,"retry")).rejects.toThrow("no longer");expect(await c.tasks.read(s,signal())).toHaveLength(4);
 c.tasks.setScenario("slow");const controller=new AbortController();const pending=apply(c,template.id,"cancel",projectId,controller.signal);controller.abort();await expect(pending).rejects.toMatchObject({name:"AbortError"});c.tasks.setScenario("normal");expect(await c.tasks.read(s,signal())).toHaveLength(4);
});
// 기능 : 지연 중 원본·대상·권한·세션 변경은 전체 적용을 거부하며 새 의도만 이후 허용한다.
it("G31 refuses late applications after template, project, access or session changes and resets all sets", async () => {
 const c=setup();const s=scope(c.runtime);const template=await source(c);c.tasks.setScenario("slow");const change=apply(c,template.id,"source-change");await c.templates.rename(s,template.id,template.revision,"Renamed",signal());await expect(change).rejects.toThrow("template changed");
 const projectChange=apply(c,template.id,"project-change");const p=c.projects.current(s,projectId)!;await c.projects.edit(s,{type:"rename",projectId,revision:p.revision,name:"Renamed project"},signal());await expect(projectChange).rejects.toThrow("project or access");
 const denied=apply(c,template.id,"denied");c.projects.setScenario("denied");await expect(denied).rejects.toThrow();c.projects.setScenario("normal");const loggedOut=apply(c,template.id,"logout");c.runtime.setSession(null);await expect(loggedOut).rejects.toMatchObject({name:"AbortError"});c.runtime.setSession("preview-a");expect(await c.tasks.read(scope(c.runtime),signal())).toHaveLength(3);
 const owner=c.runtime.getSnapshot().session!;c.runtime.openSession({...owner,role:"member",memberships:{"studio-a":{role:"member",invitation:{teamRowId:"collaborator",role:"Collaborator",projectIds:["studio-a:team-project-1"],allProjects:false}}}});await expect(apply(c,template.id,"outside")).rejects.toThrow("project");const allowed=await apply(c,template.id,"allowed","studio-a:team-project-1");expect(allowed).toHaveLength(2);
 c.runtime.reset();c.runtime.setSession("preview-a");expect(await c.templates.read(scope(c.runtime),signal())).toEqual([]);expect(await c.tasks.read(scope(c.runtime),signal())).toHaveLength(3);
},15000);
