import { createSignal, onMount } from "solid-js";
import { supabase } from "../servisi/supabase";

export default function Odjava(){
    const [result, setResult] = createSignal(null)
    onMount(async () => {
        const result = await supabase.auth.signOut();
        if (result.error){
            setResult("Odjava nije uspijela")
        }else{
            setResult("Odjava uspjesna")
        }
    })

    return(
        <>
            <Show when={result()}>{result()}</Show>
        </>
    )
}