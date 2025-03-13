<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps({
    size: { type: String, default: '24' },
});

const colorMode = useColorMode({ persist: true });
const buttonVariant = computed(() => colorMode.value === 'dark' ? 'link-light' : 'link-dark');

function setMode() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
}
</script>

<template>
    <BButton :variant="buttonVariant" class="border-0" @click="setMode">
        <Icon
            :height="props.size"
            :width="props.size"
            class="moon position-absolute translate-middle"
            :icon="colorMode === 'light' ? 'radix-icons:moon' : 'radix-icons:sun'"
        />
        <span class="visually-hidden">Toggle Color Scheme</span>
    </BButton>
</template>
