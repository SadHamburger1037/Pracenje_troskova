import { createEffect, createSignal, For } from "solid-js";
import { supabase } from "../servisi/supabase";
import { valuta } from "../src/App";

const [vrste, setVrste] = createSignal([])
const [newTypeVisible, setNewTypeVisible] = createSignal(false)
const [currentFormData, setCurrentFormData] = createSignal({
    kolicina: "",
    datum: "",
    opis: "",
    vrsta: "Vrsta troška"
})

async function handleFormData(polje, event) {
    await setCurrentFormData((old) => ({...old, [polje]: event.target.value}))
}

async function formSubmitTrosak(event) {
    event.preventDefault();
    const formData = new FormData(event.target)
    const kolicina = formData.get("kolicina")
    const datum_troska = formData.get("datum_troska")
    const opis_troska = formData.get("opis_troska")
    let vrsta_troska = formData.get("vrsta_troska")

    console.log(vrsta_troska)

    const { data, error2 } = await supabase
    .from('Vrste_troskova')
    .select('id')
    .eq('ime', vrsta_troska);

    console.log(data);
    

    if (!data[0]){
        vrsta_troska = 1
    }else{
        vrsta_troska = data[0].id
    }

    const { error } = await supabase
        .from("Troskovi")
        .insert({
            kolicina: kolicina,
            datum_troska: datum_troska,
            opis_troska: opis_troska,
            vrsta_troska: vrsta_troska
        })
    if (!error) {
        event.target.reset()
        setCurrentFormData({
            kolicina: "",
            datum: "",
            opis: "",
            vrsta: "Vrsta troška"
        })
    } else {
        alert("Spremanje nije uspijelo :(")
    }

}

async function formSubmitVrsta(event) {
    event.preventDefault();
    const formData = new FormData(event.target)
    const ime = formData.get("ime")
    const boja = formData.get("boja")

    const { data, error } = await supabase
        .from('Vrste_troskova')
        .insert([
            { ime: ime, boja: boja },
        ])
        .select()
    if (!error) {
        event.target.reset()
        await setCurrentFormData((old) => ({...old, vrsta: ime}))
        await ucitajVrste()
        toggleNewTypeVisible()
    } else {
        alert("Spremanje nije uspijelo :(")
    }

}

async function ucitajVrste() {

    const { data, error } = await supabase
        .from('Vrste_troskova')
        .select('*')
    if (error) {
        alert("Dogodila se greška, pokušajte ponovo :(")
    } else {
        setVrste(data)
    }
}

function toggleNewTypeVisible(event) {
    setNewTypeVisible(old => !old)
}

createEffect(async () => {
    await ucitajVrste()
})

export default function NoviTrosak(props) {
    return (
        <>
            <Show when={!newTypeVisible()}>
                <div class="text-3xl text-center mt-10">Upisivanje Troška</div>
                <form onSubmit={formSubmitTrosak} class="flex flex-col navbar-center mt-10">
                    <input type="number" step="0.01" name="kolicina" placeholder={"Unesite trošak u: " + valuta()} class="input input-bordered w-full max-w-xs m-2" required="" oninput={() => {handleFormData("kolicina", event)}} value={currentFormData().kolicina}/>
                    <input type="date" name="datum_troska" class="input input-bordered w-full max-w-xs m-2" required="" oninput={() => {handleFormData("datum", event)}} value={currentFormData().datum}/>
                    <textarea name="opis_troska" placeholder="Opis troška..." class="input input-bordered w-full max-w-xs m-2 h-16" oninput={() => {handleFormData("opis", event)}} value={currentFormData().opis}></textarea>
                    <select class="select select-bordered w-full max-w-xs" name="vrsta_troska" oninput={() => {handleFormData("vrsta", event)}} value={currentFormData().vrsta}>
                    <option disabled selected>Vrsta troška</option>
                        <For each={vrste()}>
                            {(item) => <option>{item.ime} </option>}
                        </For>
                        <option onclick={() => toggleNewTypeVisible()}>Stvori novu vrstu</option>
                    </select>
                    <button type="submit" class="">Unesi</button>
                </form>
            </Show>
            <Show when={newTypeVisible()}>
                <div class="text-3xl text-center mt-10">Upisivanje Vrste</div>
                <form onSubmit={formSubmitVrsta} class="flex flex-col navbar-center mt-10">
                    <input type="text" name="ime" placeholder={"Unesite ime:"} class="input input-bordered w-full max-w-xs m-2" required="" />
                    <input type="color" name="boja" class="input input-bordered w-full max-w-xs m-2" required="" />
                    <button type="submit" class="">Unesi</button>
                </form>
            </Show>
        </>
    )
}