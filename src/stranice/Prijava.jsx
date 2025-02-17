import { createSignal, useContext, createContext } from "solid-js";
import { UseAuth, AuthProvider } from "../components/AuthProvider"
import { supabase } from "../servisi/supabase";
import { A, useNavigate } from "@solidjs/router";

const [registracija, setRegistracija] = createSignal(false)



function toggleRegistracija() {
    setRegistracija(old => !old)
    console.log(registracija());

}

export default function Prijava(props) {
    const navigate = useNavigate()
    const [result, setResult] = createSignal(null)

    const session = UseAuth()

    async function formSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const email = formData.get("email")
        const password = formData.get("password")

        const result = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        console.log(result)
        if (result.error) {
            setResult("Dogodila se greska prilikom prijave")
        } else {
            setResult("Prijava je uspjela")
            navigate("/", { replace: true })
        }
    }

    async function formSubmitReg(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const email = formData.get("email")
        const password = formData.get("password")
        const confirm_password = formData.get("confirm_password")

        if (password != confirm_password){
            alert("Lozinke se ne podudaraju")
            return 0
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        console.log(result)
        if (result.error) {
            setResult("Dogodila se greska prilikom registracija")
        } else {
            setResult("Registracija je uspjela")
            navigate("/", { replace: true })
        }
    }

    return (
        <>
            <Show when={!registracija()}>
            <div class="text-3xl text-center mt-10">Prijava</div>
                <form onSubmit={formSubmit} class="flex flex-col navbar-center mt-10">
                    <label>Email adresa</label>
                    <input type="email" name="email" class="input input-bordered w-full max-w-xs m-2 mb-6" required="" />
                    <label>Lozinka</label>
                    <input type="password" name="password" class="input input-bordered w-full max-w-xs m-2 mb-6" required="" />
                    <button onclick={() => { toggleRegistracija() }} class="underline">registriraj se</button>
                    <button type="submit" class="btn btn-ghost text-xl mt-3.5">Prijavi se</button>
                </form>
            </Show>
            <Show when={registracija()}>
            <div class="text-3xl text-center mt-10">Registracija</div>
                <form onSubmit={formSubmitReg} class="flex flex-col navbar-center mt-10">
                    <label>Email adresa</label>
                    <input type="email" name="email" class="input input-bordered w-full max-w-xs m-2 mb-6" required="" />
                    <label>Lozinka</label>
                    <input type="password" name="password" class="input input-bordered w-full max-w-xs m-2 mb-6" required="" minLength="8"/>
                    <label>Ponovite Lozinku</label>
                    <input type="password" name="confirm_password" class="input input-bordered w-full max-w-xs m-2 mb-6" required="" minLength="8"/>
                    <button onclick={() => { toggleRegistracija() }} class="underline">prijavi se</button>
                    <button type="submit" class="btn btn-ghost text-xl mt-3.5">Registriraj se</button>
                </form>
            </Show>

            <Show when={result()}>{result()}</Show>
        </>
    )
}