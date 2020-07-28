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
      <div class="container">
        <div>
          <video autoplay playsinline ref="video" id="video" width="640" height="400"></video>
          <canvas ref="canvas" id="canvas" width="640" height="400"></canvas>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
/*
TODO
- videoとcanvasのサイズを動的に変更する
- canvasは非表示
- 画像サイズ小さくても良いかも
- /studentへ遷移しても画面選択が出ているのをなんとかしたい
- 停止、退出
*/

import { getCredentials, listObjects, putObject } from '~/plugins/aws';

export default {
  data () {
    return { 
      roomId: '',
      name: '',
      x: 640,
      y: 400,
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
        Key: `${this.roomId}/${this.name}`,
        Body: blob,
        ContentType: 'image/png'
      });
    }
  },
  created: async function () {
    this.roomId = this.$route.params.id
    this.name = this.$route.query.name
    if (!this.roomId || !this.name) {
      return this.$router.push({ path: `/student/` });
    }
    await getCredentials();
    const roomResult = await listObjects({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `${this.roomId}/`
    });
    if (roomResult.KeyCount === 0) {
      return this.$router.push({ path: `/student/` });
    }
    const nameResult = await listObjects({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `${this.roomId}/${this.name}`
    });
    if (nameResult.KeyCount > 0) {
      return this.$router.push({ path: `/student/` });
    }
  },
  mounted: async function() {
    const sw = window.parent.screen.width;
    const sh = window.parent.screen.height;
    this.x = Math.floor( this.y * sw / sh );
    //$('#video').css( { width: x } );

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
