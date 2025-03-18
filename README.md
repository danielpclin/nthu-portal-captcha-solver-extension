# NTHU portal captcha solver

To publish a new version:
1. change version in `dist/manifest.json`
2. update model in `src/model`, it should be in tfjs binary format. You can use docker image evenchange4/docker-tfjs-converter to convert it.
3. make any necessary changes to `src/content.js` and `src/service_worker.js`
4. run `yarn build`
5. upload `nthu_captcha.zip` to https://chrome.google.com/webstore/devconsole