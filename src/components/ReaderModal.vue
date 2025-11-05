<script setup>
const props = defineProps({ reader: Object })

const getReaderRoles = (roles) => {
  if (!Array.isArray(roles)) return ''
  return roles.map((r) => r.name || `Role ${r.id}`).join(', ')
}

const formatSocialLink = (platform, handle) => {
  const baseUrls = {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    x: 'https://x.com/',
  }
  return handle.startsWith('http') ? handle : `${baseUrls[platform]}${handle}`
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      <h2>{{ reader.first_name }} {{ reader.last_name }}</h2>
      <p><strong>Username:</strong> {{ reader.username }}</p>
      <p><strong>Email:</strong> <a :href="`mailto:${reader.email}`">{{ reader.email }}</a></p>
      <p><strong>Roles:</strong> {{ getReaderRoles(reader.roles) }}</p>
      <p><strong>Bio:</strong> {{ reader.bio }}</p>
      <div v-if="reader.genres && reader.genres.length" class="genre-display">
        <strong>Preferred Genres:</strong>
        <ul class="genre-list">
          <li v-for="genre in reader.genres" :key="genre.id" class="genre-item">
            <span class="genre-name">{{ genre.name }}</span>
            <ul v-if="genre.subgenres && genre.subgenres.length" class="subgenre-list">
              <li v-for="sub in genre.subgenres" :key="sub.id" class="subgenre-item">
                {{ sub.name }}
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div
        v-if="Array.isArray(reader.payment_options) && reader.payment_options.length"
        class="payment-display"
      >
        <strong>Preferred Payment Methods:</strong>
        <div class="payment-tags">
          <span v-for="method in reader.payment_options" :key="method" class="payment-tag">
            {{ method }}
          </span>
        </div>
      </div>

      <div v-if="reader.subscribed && reader.pricing_tiers?.length" class="pricing-display">
        <strong>Pricing Tiers:</strong>
        <ul class="pricing-list">
          <li v-for="(tier, index) in reader.pricing_tiers" :key="index">
            Up to {{ tier.word_count.toLocaleString() }} words: ${{
              (tier.price_cents / 100).toFixed(2)
            }}
          </li>
        </ul>
      </div>

      <div class="social-links" v-if="reader.facebook || reader.instagram || reader.x">
        <h4>Social Media</h4>
        <ul class="social-list">
          <li v-if="reader.facebook">
            <strong>Facebook: </strong>
            <a
              :href="formatSocialLink('facebook', reader.facebook)"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ formatSocialLink('facebook', reader.facebook) }}
            </a>
          </li>
          <li v-if="reader.instagram">
            <strong>Instagram: </strong>
            <a
              :href="formatSocialLink('instagram', reader.instagram)"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ formatSocialLink('instagram', reader.instagram) }}
            </a>
          </li>
          <li v-if="reader.x">
            <strong>X: </strong>
            <a :href="formatSocialLink('x', reader.x)" target="_blank" rel="noopener noreferrer">
              {{ formatSocialLink('x', reader.x) }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.genre-list {
  list-style: none;
  padding-left: 0;
  margin-top: 0.5rem;
}

.genre-item {
  margin-bottom: 0.75rem;
}

.genre-name {
  font-weight: bold;
  font-size: 0.95rem;
  color: #333;
}

.subgenre-list {
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.25rem;
}

.subgenre-item {
  font-size: 0.85rem;
  color: #666;
}

.payment-display {
  margin-top: 1rem;
}

.payment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.payment-tag {
  background-color: #f0f0f0;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.pricing-display {
  margin-top: 1rem;
}

.pricing-list {
  list-style: none;
  padding-left: 0;
  margin-top: 0.5rem;
}

.pricing-list li {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
</style>
