<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-2">
            生徒画面
          </h1>
          <h2 class="subtitle is-size-4">
            メディアへのアクセスを許可して画面を共有してください
          </h2>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container center-block">
        <div class="card capture-card-area">
          <header class="card-header">
            <p class="card-header-title">
              画面共有中
            </p>
          </header>
          <div class="card-content capture-content-area">
            <div class="content capture-area">
              <!-- とりあえず480p -->
              <video autoplay playsinline ref="video" id="video" :width="x" height="480" class="video-area"></video>
              <canvas ref="canvas" id="canvas" :width="x" height="480"></canvas>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
/*
TODO
- /studentへ遷移しても画面選択が出ているのをなんとかしたい
- 停止、退出
*/

import { getCredentials, putObject, getItem } from '~/plugins/aws';

export default {
  data () {
    return {
      identityId: '',
      teacherIdentityId: '',
      roomId: '',
      name: '',
      x: 854,
      y: 480,
      video: null,
      canvas: null,
      timerObj: null,
    };
  },
  methods: {
    async capture () {
      this.canvas = this.$refs.canvas;
      this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.x, this.y);
      const base64 = this.canvas.toDataURL('image/png');
      // Base64からバイナリへ変換
      const bin = atob(base64.replace(/^.*,/, ''));
      const buffer = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
      }
      // Blobを作成
      const blob = new Blob([buffer.buffer], {
        type: 'image/png'
      });
      await putObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${this.teacherIdentityId}/${this.roomId}/${this.identityId}/${this.name}`,
        Body: blob,
        ContentType: 'image/png'
      });
    }
  },
  created: async function () {
    try {
      // パラメータが不足している場合はリダイレクト
      this.roomId = this.$route.params.id
      this.name = this.$route.query.name
      if (!this.roomId || !this.name) {
        return this.$router.push({ path: `/student/` });
      }
      const cred = await getCredentials();
      // identityIdが無い場合はリダイレクト
      if ( cred.identityId ) {
        this.identityId = cred.identityId;
      } else {
        return this.$router.push({ path: `/student/` });
      }
      // 存在しないroomIdの場合はリダイレクト
      const data = await getItem({
        TableName: process.env.AWS_DYNAMODB_TABLE,
        Key: { 'roomId': this.roomId }
      });
      if ( data.Item && data.Item.identityId ){
        this.teacherIdentityId = data.Item.identityId
      } else {
        return this.$router.push({ path: `/student/` });
      }
    } catch (err) {
      console.error(err);
      return this.$router.push({ path: `/student/` });
    }
  },
  mounted: async function() {
    // 画面サイズ取得
    const sw = window.parent.screen.width;
    const sh = window.parent.screen.height;
    if ( sh/sw >= 9/16) {
      // 横長の場合、横幅100%に縦を合わせる
      this.x = Math.floor( this.y * sw / sh );
    } else {
      // 縦長の場合、縦100%に横幅を合わせる
      this.y = Math.floor( this.x * sh / sw );
    }

    this.video = this.$refs.video
    navigator.mediaDevices.getDisplayMedia({video: true, audio: false})
      .then( mediaStream => {
        this.video.srcObject = mediaStream;
      })
      .catch( error => {
        console.error( "navigator.getUserMedia error: ", error );
      });
    // とりあえず1秒おきにキャプチャ
    this.timerObj = setInterval(async () => {
      await this.capture();
    }, 1000);
  },
}
</script>

<style>
  .video-area {
    display: none;
  }

  .capture-area {
    display:inline-block;
  }

  .capture-content-area {
    display:inline-block;
  }

  .capture-card-area {
    display:inline-block;
  }
  .center-block {
    text-align: center;
    margin: 0 auto;
  }

</style>
