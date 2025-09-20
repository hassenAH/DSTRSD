import { useEffect, useState } from "react";
import Popup from "./Popup";


export default function StartupPopup() {
    const [open, setOpen] = useState(false);
    const shownFlag = "popup:seen";

    useEffect(() => {
        if (!sessionStorage.getItem(shownFlag)) {
            setOpen(true);
            sessionStorage.setItem(shownFlag, "1");
        }
    }, []);

    if (!open) return null;
    return <Popup onClose={() => setOpen(false)} />;
}
