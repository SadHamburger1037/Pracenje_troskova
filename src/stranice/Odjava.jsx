import { createSignal, onMount } from "solid-js";
import { supabase } from "../servisi/supabase";
import { Navigate, useNavigate } from "@solidjs/router";

export default function Odjava(){

    const navigate = useNavigate()

    const [result, setResult] = createSignal(null)
    onMount(async () => {
        const result = await supabase.auth.signOut();
        if (result.error){
            setResult("Odjava nije uspijela")
        }else{
            setResult("Odjava uspjesna")
            navigate("/", { replace: false })
        }
    })

    return(
        <>
            <Show when={result()}>{result()}</Show>
        </>
    )
}