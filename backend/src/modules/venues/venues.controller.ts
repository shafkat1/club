import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SearchVenuesDto, SetPresenceDto } from '../../common/dtos/venue.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  // ============================================
  // SEARCH & DISCOVERY
  // ============================================
  @Post('search')
  async searchVenues(@Body() dto: SearchVenuesDto) {
    return this.venuesService.searchVenues(dto);
  }

  @Get(':id')
  async getVenueDetails(@Param('id') venueId: string) {
    return this.venuesService.getVenueDetails(venueId);
  }

  // ============================================
  // PRESENCE MANAGEMENT
  // ============================================
  @Post('presence/set')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async setPresence(@Request() req, @Body() dto: SetPresenceDto) {
    return this.venuesService.setPresence(req.user.sub, dto);
  }

  @Post('presence/clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async clearPresence(@Request() req, @Query('venueId') venueId: string) {
    return this.venuesService.clearPresence(req.user.sub, venueId);
  }

  @Get(':id/presence')
  async getVenuePresence(@Param('id') venueId: string) {
    return this.venuesService.getVenuePresence(venueId);
  }
}
