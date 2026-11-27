const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const filename = path.resolve(__dirname, "../app/weekly/weekly-blog-link.ts");
const source = fs.readFileSync(filename, "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = new Module(filename, module);
mod.filename = filename;
mod.paths = Module._nodeModulePaths(path.dirname(filename));
mod._compile(code, filename);
const { normalizeNaverBlogUrl, blogBody, blogUrlFromBody, blogSlug, allowedNaverImageUrl } = mod.exports;

test("네이버 게시물 주소를 모바일 원문 주소로 정리한다", () => {
  const expected = "https://m.blog.naver.com/hankki09252/224340192335";
  assert.equal(normalizeNaverBlogUrl("https://blog.naver.com/hankki09252/224340192335?tracking=1"), expected);
  assert.equal(normalizeNaverBlogUrl("https://blog.naver.com/PostView.naver?blogId=hankki09252&logNo=224340192335"), expected);
  assert.equal(blogUrlFromBody(blogBody(expected)), expected);
  assert.equal(blogUrlFromBody("일반 아마온 위클리 본문"), null);
});

test("외부 사이트와 사설 주소를 블로그·이미지로 받아들이지 않는다", () => {
  for (const url of ["https://blog.naver.com.evil.example/hankki09252/224340192335", "http://blog.naver.com/hankki09252/224340192335", "https://blog.naver.com@evil.example/hankki09252/224340192335", "https://m.blog.naver.com/hankki09252"])
    assert.equal(normalizeNaverBlogUrl(url), null);
  assert.equal(allowedNaverImageUrl("https://postfiles.pstatic.net/example.jpg"), "https://postfiles.pstatic.net/example.jpg");
  assert.equal(allowedNaverImageUrl("https://postfiles.pstatic.net.evil.example/example.jpg"), null);
  assert.equal(allowedNaverImageUrl("http://127.0.0.1/example.jpg"), null);
});

test("블로그 아이디에 밑줄이 있어도 DB에서 허용하는 공유 주소를 만든다", () => {
  const desktop = "https://blog.naver.com/my_blog/224340192335?tracking=1";
  const mobile = "https://m.blog.naver.com/my_blog/224340192335";
  const slug = blogSlug(desktop);
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(slug, blogSlug(mobile));
  assert.notEqual(slug, blogSlug("https://blog.naver.com/my-blog/224340192335"));
});
