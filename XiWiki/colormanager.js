// Listen for a click on the button
try
{
    let btn = document.querySelector('.btn-toggle');
    btn.addEventListener('click', function() {
    // Then toggle (add/remove) the .dark-theme class to the body
    document.body.classList.toggle('dark-theme');  

    if(getCookie("isLightMode") == "true")
    {
        document.cookie = "isLightMode=false";
    }else
    {
        document.cookie = "isLightMode=true";
    }

    console.log("initialized button");
});
}catch (e)
{
}finally 
{

}

if(getCookie("isLightMode") == "true")
{
    document.body.classList.toggle('dark-theme');
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
