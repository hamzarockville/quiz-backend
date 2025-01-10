import { Test, TestingModule } from '@nestjs/testing';
import { VerticalController } from './vertical.controller';

describe('VerticalController', () => {
  let controller: VerticalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerticalController],
    }).compile();

    controller = module.get<VerticalController>(VerticalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
