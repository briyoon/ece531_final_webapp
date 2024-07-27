<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    import { checkAuth } from "$lib/api/auth";

    onMount(async () => {
        if (!checkAuth()) {
            goto("/login");
        } else {
            goto("/dashboard");
        }
    });
</script>
