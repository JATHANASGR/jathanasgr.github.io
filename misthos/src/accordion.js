document.addEventListener("click", AccordionCheck);

function AccordionCheck(e)
{
    if(e.target.classList.contains("module_title"))
    {
        e.target.nextElementSibling.classList.toggle("module_disable");
    }
}