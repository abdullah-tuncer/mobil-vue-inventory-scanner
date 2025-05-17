<template>

</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import {useRoute} from "vue-router";

const route = useRoute();
const satis = ref();
onMounted(async ()=>{
  await load();
});

const load = async () => {
  const id = route.params.id as string;
  satis.value = await inventoryService.getItemById(Tables.SATISLAR, id);
}

</script>

<style scoped>

</style>