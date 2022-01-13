using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RookieOnlineAssetManagement.Interfaces;
using RookieOnlineAssetManagement.Models.ReturnRequests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnRequestsController : ControllerBase
    {
        private readonly IReturnRequestService _returnRequestService;
        public ReturnRequestsController(IReturnRequestService returnRequestService)
        {
            _returnRequestService = returnRequestService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ReturnRequestCreate request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            int userId = int.Parse(User.FindFirst("userId")?.Value);
            if (userId < 0)
                return NotFound("Not found user!");
            request.RequestBy = userId;

            int returnRequestId = await _returnRequestService.Create(request);
            if (returnRequestId < 0)
                return BadRequest("Create Returning Request was unsuccessfully!");

            return Ok();
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpGet("paging")]
        public async Task<IActionResult> GetReturnRequestPagingFilter([FromQuery] ReturnRequestPagingFilterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            request.Location = User.FindFirst("location")?.Value;
            var assignments = await _returnRequestService.GetReturnRequestPagingFilter(request);
            return Ok(assignments);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpGet("{returnRequestId}")]
        public async Task<IActionResult> GetDetailedReturnRequest(int returnRequestId)
        {
            var result = await _returnRequestService.GetDetailedReturnRequest(returnRequestId);
            if (result == null)
                return NotFound("Not found!");
            return Ok(result);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{returnRequestId}")]
        public async Task<IActionResult> Cancel(int returnRequestId)
        {
            var result = await _returnRequestService.CancelReturnRequest(returnRequestId);
            if (!result)
                return BadRequest("Cancel Returning Request was unsuccessfully!");
            return Ok(result);

        }

        [Authorize(Policy = "AdminOnly")]
        [HttpGet("states")]
        public IActionResult GetRequestState()
        {
            var result = _returnRequestService.GetRequestStates();
            if (result == null)
                return NotFound("Not found!");
            return Ok(result);
        }

        //[HttpPost]
        //public async Task<IActionResult> IsCreating([FromForm] ReturnRequestCreateRequest request)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    int userId = int.Parse(User.FindFirst("userId")?.Value);
        //    if (userId < 0)
        //    {
        //        return BadRequest();
        //    }
        //    request.RequestedBy = userId;
        //    var returnRequestId = await _returnRequestService.IsCreating(request);

        //    if (returnRequestId < 0)
        //        return BadRequest();
        //    return Ok("Success");
        //}

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{Id}")]
        public async Task<IActionResult> Complete([FromRoute] int Id, [FromForm] ReturnRequestCreateRequest request)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            int userId = int.Parse(User.FindFirst("userId")?.Value);
            if (userId < 0)
            {
                return NotFound("Not found user!");
            }
            request.AcceptedBy = userId;
            request.Id = Id;
            var result = await _returnRequestService.Complete(request);
            if (!result)
                return BadRequest("Complete Returning Request was unsuccessfully!");
            return Ok(result);
        }
    }
}
