// 微信小程序组件类型声明
// 解决Component和Page的TypeScript类型问题

declare namespace WechatMiniprogram {
  interface ComponentOptions<
    D extends DataOption = DataOption,
    P extends PropertyOption = PropertyOption,
    M extends MethodOption = MethodOption
  > {
    properties?: P;
    data?: D;
    observers?: Record<string, (...args: any[]) => void>;
    methods?: M;
    lifetimes?: Partial<Lifetimes>;
    pageLifetimes?: Partial<PageLifetimes>;
    [key: string]: any;
  }

  interface PageOptions<
    D extends Record<string, any> = Record<string, any>,
    M extends Record<string, any> = Record<string, any>
  > {
    data?: D;
    [key: string]: any;
  }
}

// 全局Component函数类型
declare function Component<
  D extends WechatMiniprogram.DataOption = WechatMiniprogram.DataOption,
  P extends WechatMiniprogram.PropertyOption = WechatMiniprogram.PropertyOption,
  M extends WechatMiniprogram.MethodOption = WechatMiniprogram.MethodOption
>(options: WechatMiniprogram.ComponentOptions<D, P, M>): void;

// 全局Page函数类型
declare function Page<
  D extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>
>(options: WechatMiniprogram.PageOptions<D, M>): void;
