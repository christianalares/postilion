import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export const Logo = ({ className }: Props) => {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('aspect-square size-6', className)}
    >
      <title>Postilion</title>
      <path
        d="M194.912 0H280.657C321.624 0 354.732 5.9643 379.979 17.8929C405.702 29.8214 424.757 46.2829 437.142 67.2772C450.004 87.7943 456.911 111.174 457.864 137.417C458.817 161.751 454.768 183.939 445.717 203.979C436.666 224.019 424.28 240.719 408.56 254.079C392.84 267.439 374.739 277.22 354.255 283.423C334.248 289.149 313.288 290.58 291.375 287.717C269.939 284.377 248.979 276.027 228.496 262.667V255.51C228.496 255.51 231.354 255.51 237.07 255.51C243.263 255.51 250.885 254.556 259.936 252.647C269.463 250.739 279.228 247.16 289.232 241.911C299.712 236.663 309.477 228.551 318.528 217.577C327.579 206.603 334.486 192.05 339.25 173.919C341.155 167.716 342.346 160.797 342.823 153.163C343.775 145.051 344.013 137.656 343.537 130.976C343.061 100.439 334.724 76.1043 318.528 57.9729C302.808 39.3643 280.419 30.06 251.361 30.06H202.058C202.058 30.06 201.343 27.6743 199.914 22.9028C198.961 17.6543 197.77 12.6443 196.341 7.87288C195.389 2.6243 194.912 0 194.912 0ZM204.201 0V501H97.0198V0H204.201ZM99.1634 448.753V501H42V493.843C42.4764 493.843 43.9054 493.843 46.2873 493.843C49.1454 493.843 50.8127 493.843 51.2891 493.843C63.6745 493.843 74.1544 489.549 82.7289 480.96C91.7798 471.894 96.5434 461.159 97.0198 448.753H99.1634ZM99.1634 52.2471H97.0198C97.0198 39.8414 92.4944 29.3443 83.4435 20.7558C74.3926 11.69 63.6745 7.15714 51.2891 7.15714C50.8127 7.15714 49.3836 7.15714 47.0018 7.15714C44.62 7.15714 43.1909 7.15714 42.7145 7.15714L42 0H99.1634V52.2471ZM202.058 448.753H204.201C204.678 461.159 209.203 471.894 217.778 480.96C226.828 489.549 237.547 493.843 249.932 493.843C250.408 493.843 251.837 493.843 254.219 493.843C257.077 493.843 258.745 493.843 259.221 493.843V501H202.058V448.753Z"
        className="fill-foreground"
      />
    </svg>
  )
}
