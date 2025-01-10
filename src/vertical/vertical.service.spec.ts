import { Test, TestingModule } from '@nestjs/testing';
import { VerticalService } from './vertical.service';

describe('VerticalService', () => {
  let service: VerticalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerticalService],
    }).compile();

    service = module.get<VerticalService>(VerticalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
