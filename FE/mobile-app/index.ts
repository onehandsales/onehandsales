import { registerRootComponent } from "expo";

import App from "./App";

// 기능 : Expo Go와 native build 양쪽에서 동일한 root component를 등록합니다.
registerRootComponent(App);
