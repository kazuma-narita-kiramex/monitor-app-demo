<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-2">
            先生画面
          </h1>
          <h2 class="subtitle is-size-4">
            共有されている生徒の画面が表示されます
          </h2>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container center-block">

        <template v-for="name in students">
          <div class="card capture-card-area">
            <header class="card-header">
              <p class="card-header-title">
                {{ name }}
              </p>
            </header>
            <div class="card-content capture-content-area">
              <div class="content capture-area">
                <img :src="captures[name]" width="854" height="480">
              </div>
            </div>
          </div>
        </template>

      </div>
    </section>

  </div>
</template>

<script>
/*
TODO
- 退出した生徒のキャプチ枠がのこりつずける
*/

import { getCredentials, listObjects, getObject } from '~/plugins/aws';

export default {
  data () {
    return { 
      identityId: '',
      roomId: '',
      timerObj: null,
      captures: {},
      students: [],
    };
  },
  methods: {
    async draw () {
      const now = Date.now();
      const roomResult = await listObjects({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `${this.identityId}/${this.roomId}/`
      });
      const objects = roomResult.Contents.filter(content => {
          return content.Key !== `${this.identityId}/${this.roomId}/`;
      });

      objects.forEach(async obj => {
        const nameReg = new RegExp(`${this.identityId}/${this.roomId}/[a-zA-Z0-9:\-]+/(.*)`);
        const name = obj.Key.match(nameReg)[1];

        // 1分以上更新がなければ表示しない
        if ( ((now - obj.LastModified) / 1000) > 60 ) {
          this.$delete(this.captures, name);
          return;
        }

        const result = await getObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: obj.Key,
        });

        // 新しい生徒が参加した場合
        if ( !(this.students.find(value => value === name )) ) {
          this.students.push(name);
        }

        this.$set(this.captures, name, `data:image/png;base64,${this.encode(result.Body)}`);
      });

    },
    encode (data) {
      const str = data.reduce((a,b) => { return a+String.fromCharCode(b) }, '');
      return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
    }
  },
  created: async function () {
    try {
      // パラメータが不足している場合はリダイレクト
      this.roomId = this.$route.params.id
      if (!this.roomId) {
        return this.$router.push({ path: `/teacher/` });
      }
      const cred = await getCredentials();
      // identityIdが無い場合はリダイレクト
      if ( cred.identityId ) {
        this.identityId = cred.identityId;
      } else {
        return this.$router.push({ path: `/teacher/` });
      }
      // S3のフォルダが存在しない場合はリダイレクト
      const roomResult = await listObjects({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `${this.identityId}/${this.roomId}/`
      });
      if (roomResult.KeyCount === 0) {
        return this.$router.push({ path: `/teacher/` });
      }
    } catch (err) {
      console.error(err);
      return this.$router.push({ path: `/teacher/` });
    }
  },
  mounted: async function() {
    this.timerObj = setInterval(async () => {
      await this.draw();
    }, 1000);
  },
}
</script>

<style>
  .capture-area {
    display:inline-block;
  }

  .capture-content-area {
    display:inline-block;
  }

  .capture-card-area {
    display:inline-block;
    margin: 10px;
  }
  .center-block {
    text-align: center;
    margin: 0 auto;
  }

</style>
