<template>

    <v-card>
      <NavDrawer :drawerBool="this.$store.state.drawerShow"
      v-on:to-signOut="signOut"
      v-on:to-switchCore="switchCore"
      />
      <v-container grid-list-lg>
          <v-card
            class="pt-6 mx-auto card-body text-center"
            flat
            max-width="400"
          >
            <v-card-text>
              <v-avatar
                size="88"
              >
                <v-img
                  src="@/assets/avatar.jpeg"
                  class="mb-6"
                  height="120px"
                ></v-img>
              </v-avatar>
              <h3 class="headline mb-2">
                Ayoub BEN CHALIAH
              </h3>
              <div class="blue--text mb-2">
                ayoub1benchaliah@gmail.com
              </div>
              <div class="blue--text subheading font-weight-bold">
                I'm just curious!
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-row
              class="text-left"
              tag="v-card-text"
            >
              <v-col
                class="text-right mr-4 mb-2"
                tag="strong"
                cols="5"
              >
                Website:
              </v-col>
              <v-col>
                <a
                  href="//benchaliah.github.io"
                  target="_blank"
                >benchaliah.github.io</a>
              </v-col>
              <v-col
                class="text-right mr-4 mb-2"
                tag="strong"
                cols="5"
              >
                Github:
              </v-col>
              <v-col
                class="text-right mr-4 mb-2"
                tag="strong"
                cols="5"
              >
                <a
                  href="//github.com/benchaliah"
                  target="_blank"
                >/BenChaliah</a>
              </v-col>
            </v-row>
          </v-card>
      </v-container>



    </v-card>
</template>

<script>
import NavDrawer from '@/components/NavDrawer.vue';

const avatars = [
  '?accessoriesType=Blank&avatarStyle=Circle&clotheColor=PastelGreen&clotheType=ShirtScoopNeck&eyeType=Wink&eyebrowType=UnibrowNatural&facialHairColor=Black&facialHairType=MoustacheMagnum&hairColor=Platinum&mouthType=Concerned&skinColor=Tanned&topType=Turban',
  '?accessoriesType=Sunglasses&avatarStyle=Circle&clotheColor=Gray02&clotheType=ShirtScoopNeck&eyeType=EyeRoll&eyebrowType=RaisedExcited&facialHairColor=Red&facialHairType=BeardMagestic&hairColor=Red&hatColor=White&mouthType=Twinkle&skinColor=DarkBrown&topType=LongHairBun',
  '?accessoriesType=Prescription02&avatarStyle=Circle&clotheColor=Black&clotheType=ShirtVNeck&eyeType=Surprised&eyebrowType=Angry&facialHairColor=Blonde&facialHairType=Blank&hairColor=Blonde&hatColor=PastelOrange&mouthType=Smile&skinColor=Black&topType=LongHairNotTooLong',
  '?accessoriesType=Round&avatarStyle=Circle&clotheColor=PastelOrange&clotheType=Overall&eyeType=Close&eyebrowType=AngryNatural&facialHairColor=Blonde&facialHairType=Blank&graphicType=Pizza&hairColor=Black&hatColor=PastelBlue&mouthType=Serious&skinColor=Light&topType=LongHairBigHair',
  '?accessoriesType=Kurt&avatarStyle=Circle&clotheColor=Gray01&clotheType=BlazerShirt&eyeType=Surprised&eyebrowType=Default&facialHairColor=Red&facialHairType=Blank&graphicType=Selena&hairColor=Red&hatColor=Blue02&mouthType=Twinkle&skinColor=Pale&topType=LongHairCurly',
]

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))


export default {
  name: 'AboutCore',
  components:{
    NavDrawer,

  },
  methods: {
        switchCore(val){
          this.$emit('to-switchCore', val);
        },
        signOut() {
          this.$emit('to-signOut');
        },
        async fetchUsers (item) {
        // Remove in 6 months and say
        // you've made optimizations! :)
        await pause(1500)

        return fetch('https://jsonplaceholder.typicode.com/users')
          .then(res => res.json())
          .then(json => (item.children.push(...json)))
          .catch(err => console.warn(err))
        },
        randomAvatar () {
          this.avatar = avatars[Math.floor(Math.random() * avatars.length)]
        },

  },

  data: () => ({
      active: [],
      avatar: null,
      open: [],
      users: [],
  }),

  computed: {
    items () {
      return [
        {
          name: 'Users',
          children: this.users,
        },
      ]
    },
    selected () {
      if (!this.active.length) return undefined

      const id = this.active[0]

      return this.users.find(user => user.id === id)
    },
  },

  watch: {
    selected: 'randomAvatar',
  },


}
</script>

<style scoped>
.scroll-y {
   overflow-y: auto
}

.card-body {
  overflow-y: scroll;
  height: 83vh;
}
</style>