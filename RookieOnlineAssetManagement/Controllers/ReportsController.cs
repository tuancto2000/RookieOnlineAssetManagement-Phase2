using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RookieOnlineAssetManagement.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Controllers
{
    [Authorize(Policy = "AdminOnly")]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("ExportReports")]
        public async Task<IActionResult> ExportReports([FromQuery] string sortBy = "category", bool isAscending = true)
        {
            var reports = await _reportService.GetReports(sortBy, isAscending);
            if (reports == null)
                return BadRequest();
            var workbook = _reportService.ExportReports(reports);
            if (workbook == null)
                return BadRequest();

            using(var _workbook = workbook)
            {
                using(var stream = new MemoryStream())
                {
                    _workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Reports.xlsx");
                }
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetReports([FromQuery] string sortBy = "category", bool isAscending = true)
        {
            var result = await _reportService.GetReports(sortBy, isAscending);
            if (result == null)
                return BadRequest();
            return Ok(result);
        }
    }
}
