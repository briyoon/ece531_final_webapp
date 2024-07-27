<script>
    import "../app.css";

    import { navigating } from "$app/stores";
    import { checkAuth } from "$lib/api/auth";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    $: if (browser && $navigating?.to?.route.id !== "/login") {
        if (!checkAuth()) {
            goto("/login");
        }
    }
</script>

<div class="min-h-screen bg-gradient-to-r from-gray-800 to-gray-900">
    <slot />
</div>
