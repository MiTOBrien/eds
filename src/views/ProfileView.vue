<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

onMounted(() => {
  userStore.restoreFromLocalStorage()
})
</script>

<template>
  <main>
    <NavbarView />
    <h2>User Profile</h2>

    <form>
      <fieldset>
        <legend>User Details:</legend>
        <div class="profile-field">
          <label>Email:</label>
          <input type="email" v-model="userStore.email" size="30" disabled />
        </div>

        <div class="profile-field">
          <label for="username">Username:</label>
          <input
            type="text"
            v-model="userStore.username"
            id="username"
            name="username"
            placeholder="Username - Optional"
            size="30"
          />
        </div>

        <div class="profile-field">
          <label for="first-name">First Name:</label>
          <input type="text" v-model="userStore.first_name" id="first-name" name="first-name" placeholder="First name" size="30" />
        </div>

        <div class="profile-field">
          <label for="last-name">Last Name:</label>
          <input type="text" v-model="userStore.last_name" id="last-name" name="last-name" placeholder="Last name" size="30" />
        </div>

        <div class="profile-field">
          <label for="facebook">Facebook:</label>
          <input
            type="text"
            v-model="userStore.facebook"
            id="facebook"
            name="facebook"
            placeholder="Facebook account link - Optional"
            size="30"
          />
        </div>

        <div class="profile-field">
          <label for="instagram">Instagram:</label>
          <input
            type="text"
            v-model="userStore.instagram"
            id="instagram"
            name="instagram"
            placeholder="Instagram account link - Optional"
            size="30"
          />
        </div>

        <div class="profile-field">
          <label for="x">X:</label>
          <input type="text" v-model="userStore.x" id="x" name="x" placeholder="X account link - Optional" size="30" />
        </div>

        <div class="profile-field">
          <label for="bio">User Bio:</label>
          <textarea id="bio" rows="3" cols="30" placeholder="Bio info."> </textarea>
        </div>
      </fieldset>

      <div class="form-group">
        <fieldset class="roles-fieldset">
          <legend>Register as:</legend>
          <div class="roles-grid">
            <div class="role-option">
              <input type="checkbox" id="author" value="author" v-model="selectedRoles" />
              <label for="author">Author</label>
            </div>

            <div class="role-option">
              <input type="checkbox" id="arcreader" value="arcreader" v-model="selectedRoles" />
              <label for="arcreader">ARC Reader</label>
            </div>

            <div class="role-option">
              <input type="checkbox" id="betareader" value="betareader" v-model="selectedRoles" />
              <label for="betareader">Beta Reader</label>
            </div>

            <div class="role-option">
              <input type="checkbox" id="proofreader" value="proofreader" v-model="selectedRoles" />
              <label for="proofreader">Proof Reader</label>
            </div>

            <div>
              <p>Non-Professional Arc/Beta/Proof readers are listed for free.</p>
              <p>
                For the purposes of this website you are a professional if you charge for your
                services.
              </p>
              <p>Are you a Professional?</p>
              <input type="radio" id="yes" name="professional" value="yes" />
              <label for="yes">Yes</label>
              <input type="radio" id="no" name="professional" value="no" />
              <label for="no">No</label>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="button-wrapper">
        <button type="submit">Update Profile</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.roles-fieldset {
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin: 0;
  max-width: 500px;
}

.roles-fieldset legend {
  font-weight: 600;
  color: #555;
  padding: 0 0.5rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-option input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.role-option label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
}

.profile-field {
  display: flex;
  align-items: center;
  margin: 10px auto;
  width: 300px;
}

.profile-field label {
  width: 120px;
  text-align: right;
  margin-right: 10px;
}

.profile-field input {
  flex: 1;
  padding: 4px;
}
</style>
