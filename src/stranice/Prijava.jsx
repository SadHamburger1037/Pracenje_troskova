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
    console.log(session);
    

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
                <div>Prijava</div>
                <form onSubmit={formSubmit}>
                    <label>Email adresa</label>
                    <input type="email" name="email" required="" /><br />
                    <label>Lozinka</label>
                    <input type="password" name="password" required="" min="3" /><br />
                    <input type="Submit" value="Pošalji" class="bg-slate-600 text-white p-2 rounded" />
                </form>

            </Show>
            <Show when={registracija()}>
                <div>Registracija</div>
                <form onSubmit={formSubmitReg}>
                    <label>Email adresa</label>
                    <input type="email" name="email" required="" /><br />
                    <label>Lozinka</label>
                    <input type="password" name="password" required="" min="3" /><br />
                    <input type="Submit" value="Pošalji" class="bg-slate-600 text-white p-2 rounded" />
                </form>
            </Show>

            <div>
                <button onclick={() => { toggleRegistracija() }} class="btn text-2xl m-5">registriraj se</button>
            </div>

            <div>
            <AuthProvider>
                Korisnik: {session() ? "prijavljen" : "nije prijavljen"}
                </AuthProvider>
            </div>

            <Show when={result()}>{result()}</Show>
        </>
    )
}