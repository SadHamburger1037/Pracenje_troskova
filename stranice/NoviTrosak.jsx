import { supabase } from "../servisi/supabase";
import { valuta } from "../src/App";

async function formSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target)
    const kolicina = formData.get("kolicina")
    const datum_troska = formData.get("datum_troska")

    const { error } = await supabase
        .from("Troskovi")
        .insert({
            kolicina: kolicina,
            datum_troska: datum_troska
        })
    if (!error) {
        event.target.reset()
    } else {
        alert("Spremanje nije uspijelo :(")
    }

}

export default function NoviTrosak(props) {
    return (
        <>
            <div class="text-3xl text-center mt-10">Upisivanje Troška</div>
            <form onSubmit={formSubmit} class="flex flex-col navbar-center mt-10">
                <input type="number" name="kolicina" placeholder={"Unesite trošak u: "+ valuta()} class="input input-bordered w-full max-w-xs m-2" required=""/>
                <input type="date" name="datum_troska" class="input input-bordered w-full max-w-xs m-2" required=""/>
                <button type="submit" class="">Unesi</button>
            </form>
        </>
    )
}