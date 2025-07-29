const fs = require('fs');
const path = require('path');

// 读取飞书数据
const rawData = fs.readFileSync('data.json', 'utf8');

// 解析JSON数据
let parsedData;
try {
  parsedData = JSON.parse(rawData);
} catch (error) {
  console.error('JSON解析错误:', error.message);
  process.exit(1); // 退出程序并显示错误状态
}

// 验证数据结构并处理可能的undefined
const posts = [];
if (parsedData && parsedData.data && Array.isArray(parsedData.data.records)) {
  posts = parsedData.data.records.map(record => ({
    id: record?.fields?.['文章ID'],
    title: record?.fields?.['标题'],
    content: record?.fields?.['内容'],
    date: record?.fields?.['发布日期'],
    summary: record?.fields?.['摘要']
  }));
} else {
  console.warn('数据结构不符合预期，未找到有效的records数组');
  // 可以选择在这里退出程序，或者继续执行
  // process.exit(1);
}

// 生成列表页
const listTemplate = fs.readFileSync('_templates/index.template.html', 'utf8');
const postListHtml = posts.map(post => `
  <div class="post-item">
    <h2><a href="/posts/${post.id}.html" class="post-title">${post.title}</a></h2>
    <p class="post-meta">${post.date}</p>
    <p>${post.summary}</p>
  </div>
`).join('');
const indexHtml = listTemplate.replace('<!-- POST_LIST -->', postListHtml);
fs.writeFileSync('index.html', indexHtml);

// 生成详情页
const postTemplate = fs.readFileSync('_templates/post.template.html', 'utf8');
if (!fs.existsSync('posts')) fs.mkdirSync('posts');

posts.forEach(post => {
  let content = post.content.replace(/<img/g, '<img style="max-width:100%;"'); // 图片自适应
  const postHtml = postTemplate
    .replace('{{title}}', post.title)
    .replace('{{date}}', post.date)
    .replace('{{content}}', content);
  fs.writeFileSync(`posts/${post.id}.html`, postHtml);
});
