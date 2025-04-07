<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps({
    size: { type: String, default: '24' },
});

const colorMode = useColorMode({ persist: true, initialValue: 'light' });
const buttonVariant = computed(() => colorMode.value === 'light' ? 'link-dark' : 'link-light');
const icon = computed(() => colorMode.value === 'light' ? 'radix-icons:moon' : 'radix-icons:sun');

function setMode() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
}
</script>

<template>
    <ClientOnly>
        <BButton :variant="buttonVariant" class="border-0" @click="setMode">
            <Icon
                :height="props.size"
                :width="props.size"
                :icon="icon"
            />
            <span class="visually-hidden">Toggle Color Scheme</span>
        </BButton>
    </ClientOnly>
</template>
