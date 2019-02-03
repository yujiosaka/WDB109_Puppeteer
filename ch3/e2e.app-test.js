// ライブラリを読み込む
const puppeteer = require('puppeteer');
// アサーションを読み込む
const { expect } = require('chai');
// テストをグループ化する
describe('E2E', () => {
  let browser, page;
  // 必ずテスト前に実行される関数
  beforeEach(async () => {
    const options = process.env.DEBUG
      ? {devtools: true} // デバッグ実行時のオプション
      : {}; // 通常時のオプション
    // ブラウザを立ち上げる
    browser = await puppeteer.launch(options);
    // ブラウザのタブを開く
    page = await browser.newPage();
  });

  // 必ずテスト後に実行される関数
  afterEach(async () => {
    // ブラウザを閉じる
    await browser.close();
  });

  // カウンターのテスト
  it('increments number', async () => {
    await page.goto('http://localhost:3000');
    // ボタンをクリックする
    await page.click('button');
    // セレクターの評価結果をJavaScriptに渡して実行する
    const text = await page.$eval('p', element =>
      element.innerText
    );
    // メッセージが切り替わったことを確かめる
    expect(text).to.include('1 times.');
  });

  // リンクの登録フォームのテスト
  it('adds new link', async () => {
    await page.goto('http://localhost:3000');
    // リンクのタイトルを入力する
    await page.type(
      'input[name=title]',
      'Example Domain'
    );
    // リンクのURLを入力する
    await page.type(
      'input[name=url]',
      'http://example.com/'
    );
    // 複数の非同期処理を並列で実行する
    await Promise.all([
      // 登録されたリンクが表示されるまで待機する
      page.waitFor('//a[text()="Example Domain"]'),
      // フォームを送信する
      page.click('input[name=submit]'),
    ]);
    // セレクターの評価結果をJavaScriptに渡して実行する
    const count = await page.$$eval('a', elements =>
      elements.length
    );
    // リンクが登録されたことを確かめる
    expect(count).to.equal(5);
  });

  // パフォーマンスのテスト
  it('measures metrics', async () => {
    await page.goto('http://localhost:3000');
    // ページの読み込み完了後のメトリクスを取得する
    const {
      JSEventListeners,
      ScriptDuration,
      TaskDuration,
      JSHeapUsedSize,
      JSHeapTotalSize
    } = await page.metrics();
    // イベントリスナの登録数が100未満
    expect(JSEventListeners).to.be.below(100);
    // JavaScriptの実行時間が0.5秒未満
    expect(ScriptDuration).to.be.below(0.5);
    // ブラウザによる処理時間が2秒未満
    expect(TaskDuration).to.be.below(2);
    // JavaScriptのメモリ使用率が90%未満
    const memory = JSHeapUsedSize / JSHeapTotalSize;
    expect(memory).to.be.below(0.9);
  });

  // カバレッジのテスト
  it('measures coverage', async () => {
    // JavaScriptのカバレッジの計測を開始する
    await page.coverage.startJSCoverage()
    await page.goto('http://localhost:3000');
    await page.click('button');
    // JavaScriptのカバレッジの計測を終了する
    const coverage = await page
      .coverage.stopJSCoverage();
    let totalBytes = 0;
    let usedBytes = 0;
    for (const entry of coverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges)
        usedBytes += range.end - range.start - 1;
    }
    // JavaScriptのカバレッジが40%以上
    expect(usedBytes / totalBytes).to.be.above(0.4);
  });
});

