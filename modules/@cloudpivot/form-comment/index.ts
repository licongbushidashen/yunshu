// import pcComment from './src/components/pc/pc-form-comment.vue';
// import mbComment from './src/components/mobile/mb-form-comment.vue';
export default {
  pcComment: () => import('./src/components/pc/pc-form-comment.vue'),
  mbComment: () => import('./src/components/mobile/mb-form-comment.vue')
}