<script>
    import { navigating } from "$app/stores";
    import { checkAuth } from "$lib/api/auth";
    import { goto } from "$app/navigation";

    $: if (
        $navigating &&
        $navigating.to &&
        $navigating.to.route.id !== "/login"
    ) {
        if (!checkAuth()) {
            goto("/login");
        }
    }
</script>

<slot />
