## 第3章サンプルコード

### テストサイトの起動

```sh
$ curl "https://install.meteor.com/?release=1.8.0.2" | sh
$ meteor add meteortesting:mocha-core@5.2.0_3
$ meteor
```

### テストの実行

```sh
$ npm test
```

### テストのデバッグ実行

```sh
$ DEBUG=true npm test
```
