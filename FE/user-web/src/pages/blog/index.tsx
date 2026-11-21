import { useParams } from "react-router-dom";
import { ArticleDetail, BlogList } from "@/features/public-content";
import { CommercialAudiences } from "@/features/public-commercial";
import "@/styles/public-content.css";

// 기능 : 공개 목록과 slug별 기사를 공통 헤더·고객군 탐색 아래 조립한다.
export function BlogPage() { const { slug } = useParams(); return <><CommercialAudiences />{slug ? <ArticleDetail key={slug} slug={slug} /> : <BlogList />}</>; }
