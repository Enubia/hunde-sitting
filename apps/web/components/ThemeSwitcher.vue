<script setup lang="ts">
import { Icon } from '@iconify/vue';

const colorMode = useColorMode({ persist: true });
const buttonVariant = computed(() => colorMode.value === 'dark' ? 'outline-light' : 'outline-dark');
const sunStyle = computed(() => colorMode.value === 'light' ? { scale: '0%' } : { scale: '100%' });
const moonStyle = computed(() => colorMode.value === 'dark' ? { scale: '0%' } : { scale: '100%' });

function setMode() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
}
</script>

<template>
    <div class="position-absolute bottom-0 end-0 p-2">
        <BButton :variant="buttonVariant" @click="setMode">
            <div class="p-3">
                <Icon
                    class="moon position-absolute translate-middle"
                    icon="radix-icons:moon"
                    :style="moonStyle"
                />
                <Icon
                    class="sun position-absolute translate-middle"
                    icon="radix-icons:sun"
                    :style="sunStyle"
                />
            </div>
            <span class="visually-hidden">Toggle Color Scheme</span>
        </BButton>
    </div>
</template>

<style scoped>
.moon,
.sun {
    width: 1.2rem;
    height: 1.2rem;
}
</style>
