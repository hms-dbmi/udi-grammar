import type { InjectionKey, Ref } from 'vue';
import type { UDIPalette } from './Palette';

/**
 * Vue provide/inject key for a consumer-supplied default palette.
 *
 * `UDIToolkitProvider.vue` provides this key with a `Ref<UDIPalette | undefined>`
 * holding the prop value, so descendant `UDIVis` / `TableComponent` instances
 * can fall back to it when their own `palette` prop is omitted. Exported as a
 * named symbol so both the provider and the consumers stay aligned without
 * stringly-typed keys.
 *
 * The key holds a `Ref` (not a plain value) so the provider can re-render
 * children when the consumer swaps palettes — e.g. a theme toggle in a host
 * app that toggles light/dark palettes at runtime.
 */
export const UDI_PALETTE_KEY: InjectionKey<Ref<UDIPalette | undefined>> = Symbol('UDI_PALETTE');
