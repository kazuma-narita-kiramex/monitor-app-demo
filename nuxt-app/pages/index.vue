<template>
  <div>

    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-2">
            画面モニタリングデモへようこそ
          </h1>
          <h2 class="subtitle is-size-4">
            先生もしくは生徒として参加してください
          </h2>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">

        <div class="columns">

          <div class="column is-4 is-offset-2">
            <div class="card">
              <div class="card-image">
                <figure class="image">
                  <img src="images/teacher.png" alt="teacher" height="300">
                </figure>
              </div>
              <div class="card-content">
                <nuxt-link to="/teacher/">
                  <button class="button is-fullwidth is-primary">先生として参加</button>
                </nuxt-link>
              </div>
            </div>
          </div>
 
          <div class="column is-4">
            <div class="card">
              <div class="card-image">
                <figure class="image">
                  <img src="images/student.png" alt="teacher">
                </figure>
              </div>
              <div class="card-content">
                <nuxt-link to="/student/">
                  <button class="button is-fullwidth is-primary">生徒として参加</button>
                </nuxt-link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

  </div>
</template>






