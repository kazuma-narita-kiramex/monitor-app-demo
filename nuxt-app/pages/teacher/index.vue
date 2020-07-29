<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-2">
            先生画面トップ
          </h1>
          <h2 class="subtitle is-size-4">
            ユニークなRoomIDを入力してください
          </h2>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">

        <div class="columns">
          <div class="column is-4 is-offset-4">

            <div class="card">
              <div class="card-content">
                <validation-observer ref="observer" v-slot="{ invalid }" tag="div">
                <div class="field">
                <validation-provider name="roomId" rules="required" v-slot="{ errors }">
                  <label class="label">RoomID</label>
                  <div class="control">
                    <input class="input" type="text" v-model="roomId">
                    <p class="help is-danger">{{ errors[0] }}</p>
                  </div>
                  </validation-provider>
                </div>

                <div class="field">
                  <div class="control">
                    <button class="button is-fullwidth is-primary" @click="createRoom">参加</button>
                  </div>
                </div>

                </validation-observer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script>
import { getCredentials, listObjects, putObject } from '~/plugins/aws';

export default {
  data () {
    return { 
      roomId: '',
      test: '',
    };
  },
  methods: {
    async createRoom() {
      const isValid = await this.$refs.observer.validate();
      if (!isValid) { return }
      try {
        await getCredentials();
        const result = await listObjects({
          Bucket: process.env.AWS_S3_BUCKET,
          Prefix: `${this.roomId}/`
        });
        if (result.KeyCount > 0) {
          return this.$refs.observer.setErrors({roomId: ['このRoomIDはすでに使用されています']});
        }
        await putObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${this.roomId}/`,
          Body: ``,
        });
      } catch (err) {
        console.error(err);
        return this.$refs.observer.setErrors({roomId: ['something wrong']});
      };
      this.$router.push({ path: `/teacher/room/${this.roomId}` });
    }
  }

}
</script>
