import { nanoid } from 'nanoid';

// 'https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows.json';
// https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows-v3.json
// https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows-orc.json
// https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows-orc-ceshi.json
// https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows-scroll-ceshi.json
export const API_URL =
  'https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows-scroll.json';

// 创建获取数据的异步函数

let jsonData = null;
async function fetchData() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 为每条数据添加 id (如果远程数据没有 id 的话)
    jsonData = data.map((item) => ({
      ...item,
      id: nanoid(),
    }));
    return data.map((item) => ({
      ...item,
      id: nanoid(),
    }));
  } catch (error) {
    console.error('获取数据失败:', error);
    // 可以返回一个默认数据或者抛出错误
    return [];
  }
}

fetchData();

export default {
  jsonData,
};
