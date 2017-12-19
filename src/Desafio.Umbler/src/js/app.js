const Request = window.Request
const Headers = window.Headers
const fetch = window.fetch

class Api {
  async request (method, url, body) {
    if (body) {
      body = JSON.stringify(body)
    }

    const request = new Request('/api/' + url, {
      method: method,
      body: body,
      credentials: 'same-origin',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    })

    const resp = await fetch(request)
    if (!resp.ok && resp.status !== 400) {
      window.location.href = '/Home?error=500';
      throw Error(resp.statusText)
    }

    const jsonResult = await resp.json()

    if (resp.status === 400) {
      jsonResult.requestStatus = 400
    }

    return jsonResult
  }

  async getDomain (domainOrIp) {
    return this.request('GET', `domain/${domainOrIp}`)
  }
}

const api = new Api()

var callback = () => {
  const btn = document.getElementById('btn-search')
  const txt = document.getElementById('txt-search')
  const result = document.getElementById('whois-results')
  const table = document.getElementById('table');

  if (btn) {
    btn.onclick = async () => {
      var regex=/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
      if(txt.value.match(regex)){
        const response = await api.getDomain(txt.value);
        if (response) {
          var len = response.length;
          var txt1 = "<tr><td>name</td><td>ip</td><td>Hosted At</td></tr>";
          txt1 += "<tr><td>"+response.name+"</td><td>"+response.ip+"</td><td>"+response.hostedAt+"</td></tr>";        
          table.innerHTML = txt1;
          var txt2 = "<b>Who is:</b><br/>"+response.whoIs;
          result.innerHTML =txt2;
        }
      }
      else{
        alert("somente url's válidas são aceitas!");
      }
    }
  }
}

if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
  callback()
} else {
  document.addEventListener('DOMContentLoaded', callback)
}
