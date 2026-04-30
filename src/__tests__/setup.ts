// Minimal stubs for Foundry VTT browser globals — needed before any module loads.
// These are set on `global` so they're available in Node's test environment.

(global as any).window = {
    getComputedStyle: () => ({ getPropertyValue: () => "16px" }),
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    crypto: {
        getRandomValues: (arr: Uint32Array) => {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 0xFFFFFFFF);
            return arr;
        },
    },
};
(global as any).document = {
    documentElement: {},
};
(global as any).game = {
    settings: { get: () => ({}), set: () => {}, register: () => {} },
    user: { isGM: false, name: "Test User", id: "test-user-id" },
    i18n: { localize: (k: string) => k, format: (k: string) => k },
    socket: null,
    time: { worldTime: 0 },
};
(global as any).Hooks = {
    callAll: () => {},
    on: () => 0,
    once: () => 0,
    off: () => {},
};
(global as any).CONFIG = {
    time: { roundTime: 6 },
};
(global as any).canvas = {
    scene: null,
};
(global as any).ui = {
    notifications: { warn: () => {}, error: () => {}, info: () => {} },
};
(global as any).foundry = {
    utils: { randomID: () => "test-id" },
};
