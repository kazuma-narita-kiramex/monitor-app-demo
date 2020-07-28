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
      <div class="container">

        <!--
        <div v-for="url of urls">
          <img :src="url">
        </div>
        
        <div v-for="src of srcs">
          <img :src="src">
        </div>
        -->
        <img :src="imageSrc">
      </div>
    </section>

  </div>
</template>

<script>
import { getCredentials, listObjects, getObject, getSignedUrl } from '~/plugins/aws';

export default {
  data () {
    return { 
      roomId: '',
      timerObj: null,
      urls: [],
      srcs: [],
      imageSrc: '',
    };
  },
  methods: {
    async draw () {
      this.urls = [];
      this.srcs = [];
      const roomResult = await listObjects({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `${this.roomId}/`
      });
      const objects = roomResult.Contents.filter(content => {
          return content.Key !== `${this.roomId}/`;
      });
      objects.forEach(async obj => {
        // const url = await getSignedUrl({
        //   Bucket: process.env.AWS_S3_BUCKET,
        //   Key: obj.Key,
        // });
        // this.urls.push(url);
        // this.imageSrc =  url;

        const result = await getObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: obj.Key,
        });
        this.srcs.push(`data:image/png;base64,${this.encode(result.Body)}`);
        this.imageSrc = `data:image/png;base64,${this.encode(result.Body)}`;

      });
    },
    encode (data) {
      const str = data.reduce((a,b) => { return a+String.fromCharCode(b) }, '');
      return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
    }
  },
  created: async function () {
    this.roomId = this.$route.params.id
    if (!this.roomId) {
      return this.$router.push({ path: `/teacher/` });
    }
    await getCredentials();
    const roomResult = await listObjects({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `${this.roomId}/`
    });
    if (roomResult.KeyCount === 0) {
      return this.$router.push({ path: `/teacher/` });
    }
  },
  mounted: async function() {
    this.timerObj = setInterval(async () => {
      await this.draw();
    }, 3000);
  },
}
</script>
