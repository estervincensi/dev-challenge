using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Desafio.Umbler.Models;
using Whois.NET;
using Microsoft.EntityFrameworkCore;
using DnsClient;

namespace Desafio.Umbler.Controllers
{
    [Route("api")]
    public class DomainController : Controller
    {
        private readonly DatabaseContext _db;

        public DomainController(DatabaseContext db)
        {
            _db = db;
        }

        [HttpGet, Route("domain/{domainName}")]
        public async Task<IActionResult> Get(string domainName)
        {
            var domain = await _db.Domains.FirstOrDefaultAsync(d => d.Name == domainName);

            if (domain == null)
            {
                domain = await load(domainName);
                _db.Domains.Add(domain);
            }

            if (DateTime.Now.Subtract(domain.UpdatedAt).TotalMinutes > domain.Ttl)
            {
                domain = await load(domainName);
            }

            await _db.SaveChangesAsync();
            var response2 = new ResponseViewModel();
            response2.Name = domain.Name;
            response2.Ip = domain.Ip;
            response2.WhoIs = domain.WhoIs;
            response2.HostedAt = domain.HostedAt;
            return Ok(response2);
        }
        private async Task<Domain> load(string domainName){
                Domain domain;
                var response = await WhoisClient.QueryAsync(domainName);

                var lookup = new LookupClient();
                var result = await lookup.QueryAsync(domainName, QueryType.ANY);
                var record = result.Answers.ARecords().FirstOrDefault();
                var address = record?.Address;
                var ip = address?.ToString();

                var hostResponse = await WhoisClient.QueryAsync(ip);

                domain = new Domain
                {
                    Name = domainName,
                    Ip = ip,
                    UpdatedAt = DateTime.Now,
                    WhoIs = response.Raw,
                    Ttl = record?.TimeToLive ?? 0,
                    HostedAt = hostResponse.OrganizationName
                };
                return domain;
        }
    }
}
