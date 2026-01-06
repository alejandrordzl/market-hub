export function autofocusMainSearchInput() {
    const inputElement = document.getElementById(
        "barCode"
    ) as HTMLInputElement | null;
    inputElement?.focus();
}