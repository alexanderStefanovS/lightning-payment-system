import { Controller, Get, Post, Body, Param, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenDto } from 'src/dtos/token.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/enums/user-role';
import { Roles } from 'src/auth/decorators/set-roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('token')
export class TokenController {
    constructor(private readonly tokenService: TokenService) {}

    @Post()
    public create(@Body() tokenDto: TokenDto, @Req() req: any) {
        return this.tokenService.createToken(tokenDto, req.user.id);
    }

    @Get('per-org/:orgId')
    public findTokensPerOrgId(@Param('orgId') orgId: string) {
        return this.tokenService.findTokensByOrgId(orgId);
    }
}
