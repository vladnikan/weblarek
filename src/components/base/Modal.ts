//открытие попапа
function openPopup(popupElement: HTMLElement) {
    popupElement.classList.add('modal_active');
}
//закрытие попапа
function closePopup(popupElement: HTMLElement) {
    popupElement.classList.remove('modal_active');
}
//закрытие попапа 
function closePopupOverlay(popupElement: HTMLElement) {
    popupElement.addEventListener("click", function(evt) {
        if (evt.target === popupElement) {
            closePopup(popupElement);
        }
    })
}
//закрытие попапа при нажатии на эскейп
function closeEscPopup(evt: KeyboardEvent) {
    if(evt.key === "Escape") {
        const openedPopup: HTMLElement = document.querySelector('.modal_active');
        if (openedPopup) {
            closePopup(openedPopup);
        }
    }
}

export {openPopup, closeEscPopup, closePopup, closePopupOverlay}