// ライブラリを読み込む
const puppeteer = require('puppeteer');
(async () => {
  const options = process.env.DEBUG
    ? {devtools: true} // デバッグ実行時のオプション
    : {}; // 通常時のオプション
  // ブラウザを立ち上げる
  const browser = await puppeteer.launch(options);
  // ブラウザのタブを開く
  const page = await browser.newPage();
  // ユーザーエージェントを指定する
  await page.setUserAgent(
    `WDB109 Puppeteer (${process.env.NOTE_EMAIL})`
  );
  // リクエストのフィルタリングを有効化する
  await page.setRequestInterception(true);
  // リクエストイベントを受け取る
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      // リクエストをブロックする
      request.abort();
    } else {
      // リクエストを許可する
      request.continue();
    }
  });
  // ログインフォームにアクセスする
  await page.goto('https://note.mu/login');
  // メールアドレスを入力する
  await page.type(
    'input[name=login]',
    process.env.NOTE_EMAIL
  );
  // 環境変数を使ってパスワードを入力する
  await page.type(
    'input[name=password]',
    process.env.NOTE_PASSWORD
  );
  // 複数の非同期処理を並列で実行する
  await Promise.all([
    // タイムラインが表示されるまで待機する
    page.waitFor('.feed'),
    // ログインする
    page.click('button')
  ]);
  // ブラウザ上で関数を実行し、trueが返るまで待機する
  await page.waitFor(() => {
  // 画面下部までスクロールする
    window.scrollTo(0, document.body.scrollHeight);
    // ノートの件数が20件以上かチェック
    const notes = document.querySelectorAll('.feed');
    return notes.length >= 20;
  });
  // ノートのタイトルとURLの一覧を受け取る
  const query = '.renewal-p-cardItem__title a';
  const notes = await page.$$eval(query, anchors =>
    anchors.map(anchor => ({
      title: anchor.innerText,
      url: anchor.href
    }))
  );
  // ログに出力する
  console.log(notes);
  // ブラウザを閉じる
  await browser.close();
})();

