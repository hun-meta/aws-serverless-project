"use strict";
/**
 * Health Check Service 에서 사용하는 요청 DTO 클래스 정의 파일
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckRequestDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * Health Check 요청 DTO
 */
class HealthCheckRequestDto {
    constructor() {
        this.requestTimestamp = Date.now();
    }
}
exports.HealthCheckRequestDto = HealthCheckRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)()
], HealthCheckRequestDto.prototype, "requestTimestamp", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhbHRoLWNoZWNrLXJlcXVlc3QuZHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGVhbHRoLWNoZWNrLXJlcXVlc3QuZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7O0FBRUgscURBQXVEO0FBRXZEOztHQUVHO0FBQ0gsTUFBYSxxQkFBcUI7SUFBbEM7UUFJSSxxQkFBZ0IsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUMsQ0FBQztDQUFBO0FBTEQsc0RBS0M7QUFERztJQUZDLElBQUEsNEJBQVUsR0FBRTtJQUNaLElBQUEsMEJBQVEsR0FBRTsrREFDMkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEhlYWx0aCBDaGVjayBTZXJ2aWNlIOyXkOyEnCDsgqzsmqntlZjripQg7JqU7LKtIERUTyDtgbTrnpjsiqQg7KCV7J2YIO2MjOydvFxuICovXG5cbmltcG9ydCB7IElzTnVtYmVyLCBJc09wdGlvbmFsIH0gZnJvbSBcImNsYXNzLXZhbGlkYXRvclwiO1xuXG4vKipcbiAqIEhlYWx0aCBDaGVjayDsmpTssq0gRFRPXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWFsdGhDaGVja1JlcXVlc3REdG8ge1xuICAgIFxuICAgIEBJc09wdGlvbmFsKClcbiAgICBASXNOdW1iZXIoKVxuICAgIHJlcXVlc3RUaW1lc3RhbXA6IG51bWJlciA9IERhdGUubm93KCk7XG59Il19