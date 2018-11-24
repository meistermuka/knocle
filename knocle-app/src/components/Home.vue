<template>
    <div class="ui stackable grid vertically padded container">
        <div class="four wide column">
            <UserSidebar :user="user"/>
        </div>

        <div class="eight wide column">
            <div class="ui segment">
                <h2 class="ui medium dividing header">Timeline</h2>

                <Tweets
                    :tweets.sync="tweets"
                    :authUser="user"
                />
            </div>
        </div>

        <div class="four wide column"></div>
    </div>
</template>

<script>
import UserSidebar from '@/components/User/UserSidebar'
import Tweets from '@/components/Tweet/Tweets'

export default {
  name: 'Home',
  components: {
    UserSidebar,
    Tweets
  },
  data () {
    return {
      user: '',
      tweets: []
    }
  },
  beforeRouteEnter (to, from, next) {
    const token = localStorage.getItem('knocle-token')

    return token ? next() : next('/login')
  },
  created () {
    this.fetchAuthenticatedUser()
    this.fetchUserTimeline()
  },
  methods: {
    fetchAuthenticatedUser () {
      const token = localStorage.getItem('knocle-token')

      axios
        .get('/account/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          this.user = response.data.data
        })
    },
    fetchUserTimeline () {
      const token = localStorage.getItem('knocle-token')

      axios
        .get('/users/timeline', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          this.tweets = response.data.data.reverse()
        })
    }
  }
}
</script>

<style>
</style>
