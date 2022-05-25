declare function jsx(str: TemplateStringsArray): HTMLElement;

function $(selector: string){
    return document.querySelector(selector)
}

window.onload = () => {
    $(".overlay")!.append(jsx`<div class="card" value=2 suit="spades" style="height:112px;width:80px">`)
}