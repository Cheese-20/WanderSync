// vite.config.js
import { defineConfig } from "file:///C:/Users/User/OneDrive/Documents/GitHub/WanderSync/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/User/OneDrive/Documents/GitHub/WanderSync/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    // Development server port for Vite
    port: 4173,
    // Proxy /api requests to the ASP.NET backend running locally.
    // This avoids CORS issues during development — the browser hits Vite,
    // and Vite forwards the request to the backend.
    proxy: {
      "/api": {
        target: "http://localhost:5200",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcV2FuZGVyU3luY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXNlclxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXFdhbmRlclN5bmNcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VzZXIvT25lRHJpdmUvRG9jdW1lbnRzL0dpdEh1Yi9XYW5kZXJTeW5jL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIC8vIERldmVsb3BtZW50IHNlcnZlciBwb3J0IGZvciBWaXRlXHJcbiAgICBwb3J0OiA0MTczLFxyXG4gICAgLy8gUHJveHkgL2FwaSByZXF1ZXN0cyB0byB0aGUgQVNQLk5FVCBiYWNrZW5kIHJ1bm5pbmcgbG9jYWxseS5cclxuICAgIC8vIFRoaXMgYXZvaWRzIENPUlMgaXNzdWVzIGR1cmluZyBkZXZlbG9wbWVudCBcdTIwMTQgdGhlIGJyb3dzZXIgaGl0cyBWaXRlLFxyXG4gICAgLy8gYW5kIFZpdGUgZm9yd2FyZHMgdGhlIHJlcXVlc3QgdG8gdGhlIGJhY2tlbmQuXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUyMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVixTQUFTLG9CQUFvQjtBQUNuWCxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQTtBQUFBLElBRU4sTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSU4sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
