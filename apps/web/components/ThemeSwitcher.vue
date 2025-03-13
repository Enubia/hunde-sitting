<script setup lang="ts">
import { Icon } from '@iconify/vue';

const colorMode = useColorMode();
const buttonVariant = computed(() => colorMode.value === 'dark' ? 'outline-light' : 'outline-dark');
</script>

<template>
    <div class="position-absolute bottom-0 end-0 p-2">
        <BButton :variant="buttonVariant" @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'">
            <div class="p-3">
                <Icon class="moon position-absolute translate-middle" icon="radix-icons:moon" />
                <Icon class="sun position-absolute translate-middle" icon="radix-icons:sun" />
            </div>
            <span class="visually-hidden">Toggle Color Scheme</span>
        </BButton>
    </div>
</template>

<style lang="scss">
.moon,
.sun {
    width: 1.2rem;
    height: 1.2rem;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
}

body[data-bs-theme='dark'] {
    .moon {
        transform: rotate(-90deg);
        scale: 0%;
    }

    .sun {
        transform: rotate(0deg);
        scale: 100%;
    }
}

body[data-bs-theme='light'] {
    .moon {
        transform: rotate(0deg);
        scale: 100%;
    }

    .sun {
        transform: rotate(90deg);
        scale: 0%;
    }
}
</style>
